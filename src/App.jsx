import { useEffect, useState, useCallback } from 'react';
import { getMergedCategories } from './lib/mergedCategories';
import { loadList } from './lib/parseList';
import { buildFrameGeometry } from './lib/frameGeometry';
import { DEFAULT_LAYOUT, FONT_STACKS, currentAcademicYear } from './lib/adminStore';
import { loadLiveLayouts, getLiveFrameLayout } from './lib/liveLayouts';
import LoadingScreen from './components/LoadingScreen';
import Welcome from './components/Welcome';
import StepProgress from './components/StepProgress';
import CategoryStep from './components/steps/CategoryStep';
import FrameStep from './components/steps/FrameStep';
import DetailsStep from './components/steps/DetailsStep';
import AdjustStep from './components/steps/AdjustStep';
import SuccessStep from './components/steps/SuccessStep';
import './App.css';

const SIZE = 1254;
const BASE = import.meta.env.BASE_URL;
const WELCOME_KEY = 'jrmsu_welcomed_v1'; // sessionStorage: shown once per browser session
const MIN_LOADING_MS = 900;

export default function App() {
  // 'loading' -> 'welcome' (first visit this session only) -> 'category' ->
  // 'frame' -> 'details' -> 'adjust' -> 'done'
  const [step, setStep] = useState('loading');

  const [categories, setCategories] = useState({});
  const [category, setCategory] = useState('');
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [frameImg, setFrameImg] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [programOptions, setProgramOptions] = useState([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [program, setProgram] = useState('');

  const [photoImg, setPhotoImg] = useState(null);
  const [photoState, setPhotoState] = useState({ x: SIZE / 2, y: SIZE / 2, scale: 1, rotation: 0, baseScale: 1 });
  const [textState, setTextState] = useState({ x: SIZE / 2, y: SIZE - 170 });
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const [outputDataUrl, setOutputDataUrl] = useState(null);
  const [outputFileName, setOutputFileName] = useState('');

  const config = categories[category] || { label: category, folder: category, listFile: null, frames: [] };

  // Fetch categories once, then route to 'welcome' (first visit this
  // session) or straight to 'category' (refresh / return visit). A minimum
  // display time keeps the loading screen from flashing instantly on fast
  // connections.
  useEffect(() => {
    let alive = true;
    const t0 = Date.now();
    getMergedCategories().then((cats) => {
      if (!alive) return;
      setCategories(cats);
      setCategory((prev) => prev || Object.keys(cats)[0] || '');
      const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - t0));
      setTimeout(() => {
        if (!alive) return;
        const seen = sessionStorage.getItem(WELCOME_KEY);
        setStep(seen ? 'category' : 'welcome');
      }, wait);
    });
    return () => {
      alive = false;
    };
  }, []);

  const selectFrame = useCallback((frame) => {
    setError('');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const geo = buildFrameGeometry(img, SIZE);
      setFrameImg(img);
      setGeometry(geo);
      setSelectedFrame(frame);

      // Precedence: (1) live layout from the server (/api/layout) — the
      // real, shared-by-everyone position, published by the admin;
      // (2) a fresh live detection as a last resort for brand-new frames
      // nobody has positioned yet.
      const liveLayouts = await loadLiveLayouts(frame.categoryKey);
      const fromServer = getLiveFrameLayout(liveLayouts, frame.id);
      if (fromServer) {
        setLayout({ ...DEFAULT_LAYOUT, ...fromServer });
      } else {
        const detected = geo.nameplate
          ? { x: geo.nameplate.x + geo.nameplate.w / 2, y: geo.nameplate.y + geo.nameplate.h / 2 - 10 }
          : { x: SIZE / 2, y: SIZE - 170 };
        setLayout({ ...DEFAULT_LAYOUT, anchorX: detected.x, anchorY: detected.y });
      }

      setPhotoImg((prevPhoto) => {
        if (prevPhoto) {
          const fill = Math.max(geo.hole.w / prevPhoto.width, geo.hole.h / prevPhoto.height);
          setPhotoState({
            x: geo.hole.x + geo.hole.w / 2,
            y: geo.hole.y + geo.hole.h / 2,
            scale: 1,
            rotation: 0,
            baseScale: fill,
          });
        }
        return prevPhoto;
      });
    };
    img.onerror = () => setError(`Could not load ${frame.label || frame.file}`);
    img.src = frame.isCustom ? frame.file : `${BASE}${frame.folder}/${frame.file}`;
  }, []);

  // load the program list + first frame whenever category changes
  useEffect(() => {
    if (!category) return;
    setError('');
    setSelectedFrame(null);
    setFrameImg(null);
    setGeometry(null);

    if (config.listFile) {
      loadList(`${BASE}${config.listFile}`)
        .then(setProgramOptions)
        .catch((err) =>
          setError(
            `Could not load ${config.listFile}. If you're opening this via file://, serve it through a dev server instead. fetch() can't read local files directly. (${err.message})`
          )
        );
    } else {
      setProgramOptions([]);
    }

    if (config.frames.length) {
      selectFrame({ ...config.frames[0], folder: config.folder, categoryKey: category });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  function handleSelectFrame(f) {
    selectFrame({ ...f, folder: config.folder, categoryKey: category });
  }

  function handlePhotoFile(file) {
    if (!geometry) {
      setError('Select a frame first.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const fill = Math.max(geometry.hole.w / img.width, geometry.hole.h / img.height);
        setPhotoImg(img);
        setPhotoState({
          x: geometry.hole.x + geometry.hole.w / 2,
          y: geometry.hole.y + geometry.hole.h / 2,
          scale: 1,
          rotation: 0,
          baseScale: fill,
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setZoom(v) {
    setPhotoState((s) => ({ ...s, scale: v / 100 }));
  }
  function setRotation(v) {
    setPhotoState((s) => ({ ...s, rotation: v }));
  }

  function renderOutput() {
    const out = document.createElement('canvas');
    out.width = SIZE;
    out.height = SIZE;
    const octx = out.getContext('2d');

    if (geometry) {
      const photoLayer = document.createElement('canvas');
      photoLayer.width = SIZE;
      photoLayer.height = SIZE;
      const pctx = photoLayer.getContext('2d');
      if (photoImg) {
        pctx.save();
        pctx.translate(photoState.x, photoState.y);
        pctx.rotate((photoState.rotation * Math.PI) / 180);
        const s = photoState.baseScale * photoState.scale;
        pctx.drawImage(photoImg, (-photoImg.width * s) / 2, (-photoImg.height * s) / 2, photoImg.width * s, photoImg.height * s);
        pctx.restore();
        pctx.globalCompositeOperation = 'destination-in';
        pctx.drawImage(geometry.maskCanvas, 0, 0);
      }
      octx.drawImage(photoLayer, 0, 0);
    }
    if (frameImg) octx.drawImage(frameImg, 0, 0, SIZE, SIZE);

    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    const nameFont = FONT_STACKS[layout.nameFont] || FONT_STACKS.display;
    const programFont = FONT_STACKS[layout.programFont] || FONT_STACKS.mono;
    if (name) {
      octx.font = `${nameFont.weight} ${layout.nameSize}px ${nameFont.stack}`;
      octx.fillStyle = layout.nameColor;
      octx.fillText(name, textState.x + layout.nameOffsetX, textState.y + layout.nameOffsetY);
    }
    if (program) {
      octx.font = `${programFont.weight} ${layout.programSize}px ${programFont.stack}`;
      octx.fillStyle = layout.programColor;
      octx.fillText(
        program,
        textState.x + layout.programOffsetX,
        textState.y + layout.programOffsetY
      );
    }

    return out.toDataURL('image/png');
  }

  function triggerDownload(dataUrl, fileName) {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  }

  function handleDownload() {
    const dataUrl = renderOutput();
    const safeName = name.trim().replace(/\s+/g, '_') || 'frame';
    const fileName = `${safeName}_JRMSU_Frame.png`;
    setOutputDataUrl(dataUrl);
    setOutputFileName(fileName);
    triggerDownload(dataUrl, fileName);
    setStep('done');
  }

  function handleDownloadAgain() {
    if (outputDataUrl) triggerDownload(outputDataUrl, outputFileName);
  }

  function handleCreateAnother() {
    setName('');
    setProgram('');
    setPhotoImg(null);
    setPhotoState({ x: SIZE / 2, y: SIZE / 2, scale: 1, rotation: 0, baseScale: 1 });
    setSelectedFrame(null);
    setFrameImg(null);
    setGeometry(null);
    setOutputDataUrl(null);
    setOutputFileName('');
    setStep('category');
  }

  function handleStart() {
    sessionStorage.setItem(WELCOME_KEY, '1');
    setStep('category');
  }

  const showStepProgress = ['category', 'frame', 'details', 'adjust'].includes(step);

  return (
    <div className="app">
      {step !== 'loading' && step !== 'welcome' && (
        <header className="app__header">
          <p className="mono app__eyebrow">jrmsu · frame lab</p>
          <h1 className="app__title">Frame Generator</h1>
          <span className="mono app__ay">{currentAcademicYear()}</span>
          {showStepProgress && <StepProgress step={step} />}
        </header>
      )}

      <main className="app__main app__main--wizard">
        {step === 'loading' && <LoadingScreen />}

        {step === 'welcome' && <Welcome onStart={handleStart} />}

        {step === 'category' && (
          <CategoryStep
            categories={categories}
            category={category}
            setCategory={setCategory}
            onNext={() => setStep('frame')}
            error={error}
          />
        )}

        {step === 'frame' && (
          <FrameStep
            frames={config.frames.map((f) => ({ ...f, folder: config.folder }))}
            selectedFrameId={selectedFrame?.id}
            onSelectFrame={handleSelectFrame}
            categoryLabel={config.label}
            onBack={() => setStep('category')}
            onNext={() => setStep('details')}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            name={name}
            setName={setName}
            program={program}
            setProgram={setProgram}
            programOptions={programOptions}
            allowFreeTextProgram={!config.listFile}
            onPhotoFile={handlePhotoFile}
            hasPhoto={!!photoImg}
            onBack={() => setStep('frame')}
            onNext={() => setStep('adjust')}
          />
        )}

        {step === 'adjust' && (
          <AdjustStep
            frameImg={frameImg}
            geometry={geometry}
            photoImg={photoImg}
            photoState={photoState}
            setPhotoState={setPhotoState}
            textState={textState}
            setTextState={setTextState}
            name={name}
            program={program}
            layout={layout}
            zoom={Math.round(photoState.scale * 100)}
            setZoom={setZoom}
            rotation={photoState.rotation}
            setRotation={setRotation}
            onBack={() => setStep('details')}
            onDownload={handleDownload}
            error={error}
          />
        )}

        {step === 'done' && (
          <SuccessStep
            outputDataUrl={outputDataUrl}
            fileName={outputFileName}
            onDownloadAgain={handleDownloadAgain}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </main>

      {step !== 'loading' && step !== 'welcome' && (
        <footer className="app__footer mono">
          <span>made for jrmsu students</span>
          <span className="app__ack">Created by Julharie Maddin-Gov and the Frame Lab crew</span>
        </footer>
      )}
    </div>
  );
}

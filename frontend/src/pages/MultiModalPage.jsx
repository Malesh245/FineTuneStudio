import { useState } from 'react';
import { Image, FileAudio, Globe, Sparkles, Upload, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MODALITIES = [
  {
    id: 'vision', name: 'Vision-Language', icon: Image, color: '#6366f1',
    description: 'Fine-tune models that understand both images and text.',
    models: ['LLaVA-1.5-7B', 'Qwen-VL-Chat', 'InternVL-2B'],
    useCases: ['Visual Q&A', 'Image Captioning', 'Document Analysis', 'Medical Imaging'],
  },
  {
    id: 'audio', name: 'Audio-Language', icon: FileAudio, color: '#10b981',
    description: 'Train models on speech, music, and audio classification.',
    models: ['Whisper-Small', 'Wav2Vec2-Base', 'CLAP-Audio'],
    useCases: ['Speech-to-Text', 'Audio Classification', 'Voice Cloning', 'Music Tagging'],
  },
  {
    id: 'multilingual', name: 'Multi-Language', icon: Globe, color: '#f59e0b',
    description: 'Train models in 100+ languages with cross-lingual transfer.',
    models: ['mBERT', 'XLM-RoBERTa', 'BLOOM-1B'],
    useCases: ['Translation', 'Cross-lingual NER', 'Multilingual Chat', 'Code-Switching'],
  },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
];

export default function MultiModalPage() {
  const [selectedModality, setSelectedModality] = useState('vision');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedLangs, setSelectedLangs] = useState(['en', 'hi']);
  const [training, setTraining] = useState(false);
  const [done, setDone] = useState(false);
  const { token } = useAuth();

  const modality = MODALITIES.find(m => m.id === selectedModality);

  const handleTrain = () => {
    setTraining(true); setDone(false);
    setTimeout(() => { setTraining(false); setDone(true); }, 3000);
  };

  const toggleLang = (code) => {
    setSelectedLangs(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Multi-Modal Fine-Tuning</h2>
            <p>Train models on images, audio, and 100+ languages</p>
          </div>
          <span className="badge badge-purple" style={{ fontSize: 11 }}>Coming Soon</span>
        </div>
      </div>

      <div className="page-content">
        {/* Modality Selection */}
        <div className="grid-3 mb-6" style={{ gap: 16 }}>
          {MODALITIES.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.id} onClick={() => { setSelectedModality(m.id); setSelectedModel(m.models[0]); }}
                style={{
                  padding: 24, borderRadius: 16, cursor: 'pointer', textAlign: 'center',
                  background: selectedModality === m.id ? `${m.color}10` : 'var(--bg-elevated)',
                  border: `2px solid ${selectedModality === m.id ? m.color : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${m.color}15`,
                }}>
                  <Icon size={28} color={m.color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.description}</div>
              </div>
            );
          })}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Model Selection */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Select Model</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {modality?.models.map(m => (
                  <div key={m} onClick={() => setSelectedModel(m)} style={{
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    background: selectedModel === m ? `${modality.color}10` : 'var(--bg-tertiary)',
                    border: `1.5px solid ${selectedModel === m ? modality.color : 'var(--border)'}`,
                    fontSize: 13, fontWeight: selectedModel === m ? 700 : 400,
                    transition: 'all 0.15s',
                  }}>{m}</div>
                ))}
              </div>
            </div>

            {/* Language selector for multilingual */}
            {selectedModality === 'multilingual' && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Languages</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => toggleLang(l.code)}
                      className={`btn btn-sm ${selectedLangs.includes(l.code) ? 'btn-primary' : 'btn-ghost'}`}>
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload area */}
            <div className="card" style={{
              padding: 32, textAlign: 'center', border: '2px dashed var(--border)',
              background: 'var(--bg-tertiary)',
            }}>
              <Upload size={32} color="var(--text-tertiary)" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {selectedModality === 'vision' ? 'Drop images + captions here' :
                 selectedModality === 'audio' ? 'Drop audio files + transcripts here' :
                 'Drop multilingual text files here'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Supported: {selectedModality === 'vision' ? 'JPEG, PNG, WebP' :
                            selectedModality === 'audio' ? 'WAV, MP3, FLAC' : 'CSV, JSON, TXT'}
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleTrain} disabled={training}
              style={{ background: `linear-gradient(135deg, ${modality?.color}, #a855f7)`, border: 'none' }}>
              {training ? <><Loader2 size={18} className="animate-spin" /> Training...</> :
               done ? <><CheckCircle2 size={18} /> Training Complete!</> :
               <><Sparkles size={18} /> Start Multi-Modal Training</>}
            </button>
          </div>

          {/* Use Cases */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              {modality?.name} Use Cases
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {modality?.useCases.map((uc, i) => (
                <div key={uc} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 10,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${modality.color}15`, color: modality.color,
                    fontSize: 12, fontWeight: 700,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{uc}</span>
                </div>
              ))}
            </div>

            {done && (
              <div className="animate-fade" style={{
                marginTop: 20, padding: 20, borderRadius: 12, textAlign: 'center',
                background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>Model Ready!</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Your {modality?.name} model has been fine-tuned successfully.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

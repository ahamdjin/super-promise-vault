import { useEffect, useMemo, useState } from 'react';
import { guessCompanyName } from '@/lib/provider-utils';
import type {
  CapturedSupportContext,
  DetectionResult,
  SupportCaseDraft,
} from '@/lib/types';
import './App.css';

function App() {
  const [inspection, setInspection] = useState<DetectionResult | null>(null);
  const [capture, setCapture] = useState<CapturedSupportContext | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('Checking current page...');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    caseId: '',
    orderId: '',
    promisedOutcome: '',
    promiseSummary: '',
    amount: '',
    followUpDate: '',
  });

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      setError('');
      const [inspected, cases] = await Promise.all([
        browser.runtime.sendMessage({ type: 'inspect-active-tab' }) as Promise<DetectionResult>,
        browser.runtime.sendMessage({ type: 'list-cases' }) as Promise<SupportCaseDraft[]>,
      ]);

      setInspection(inspected);
      setSavedCount(cases.length);
      setStatus(
        inspected.provider === 'unknown'
          ? 'No supported provider detected yet. Screenshot fallback is still available.'
          : `Ready to capture ${inspected.provider} support context.`,
      );
      setForm((current) => ({
        ...current,
        companyName: inspected.domain ? guessCompanyName(inspected.domain) : current.companyName,
      }));
    } catch (runtimeError) {
      setError(runtimeError instanceof Error ? runtimeError.message : 'Failed to inspect the page.');
    }
  }

  async function handleCapture() {
    try {
      setError('');
      setStatus('Capturing visible support context...');
      const result = (await browser.runtime.sendMessage({
        type: 'capture-support-context',
      })) as CapturedSupportContext;

      setCapture(result);
      setInspection(result.detection);
      setForm((current) => ({
        companyName: current.companyName || guessCompanyName(result.detection.domain),
        caseId: current.caseId,
        orderId: current.orderId,
        promisedOutcome: current.promisedOutcome,
        promiseSummary:
          current.promiseSummary ||
          result.extraction.rawText.slice(0, 280) ||
          'Support promise captured. Add a short summary before saving.',
        amount: current.amount,
        followUpDate:
          current.followUpDate ||
          new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      }));
      setStatus(
        result.extraction.messages.length
          ? `Captured ${result.extraction.messages.length} visible messages.`
          : 'Screenshot captured. Transcript extraction was limited.',
      );
    } catch (runtimeError) {
      setError(runtimeError instanceof Error ? runtimeError.message : 'Capture failed.');
    }
  }

  async function handleSave() {
    if (!inspection) return;

    setSaving(true);
    setError('');

    try {
      const draft: SupportCaseDraft = {
        id: crypto.randomUUID(),
        provider: inspection.provider,
        companyName: form.companyName || guessCompanyName(inspection.domain),
        pageUrl: inspection.url,
        pageTitle: inspection.title,
        domain: inspection.domain,
        caseId: form.caseId,
        orderId: form.orderId,
        promisedOutcome: form.promisedOutcome || 'Follow up with support',
        promiseSummary: form.promiseSummary,
        amount: form.amount,
        followUpDate: form.followUpDate,
        screenshotDataUrl: capture?.screenshotDataUrl,
        transcriptPreview: capture?.extraction.rawText.slice(0, 400) || '',
        messages: capture?.extraction.messages || [],
        status: 'promised',
        createdAt: new Date().toISOString(),
      };

      const cases = (await browser.runtime.sendMessage({
        type: 'save-case',
        payload: draft,
      })) as SupportCaseDraft[];

      setSavedCount(cases.length);
      setStatus('Support promise saved locally. Open the dashboard to review it.');
    } catch (runtimeError) {
      setError(runtimeError instanceof Error ? runtimeError.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  const transcriptSnippet = useMemo(() => {
    if (!capture?.extraction.messages.length) return [];
    return capture.extraction.messages.slice(0, 4);
  }, [capture]);

  return (
    <div className="shell">
      <header className="hero">
        <div className="eyebrow">Support Promise Vault</div>
        <h1>Capture the promise before it disappears.</h1>
        <p>{status}</p>
      </header>

      <section className="stack status-panel">
        <div className="pill-row">
          <span className={`pill tier-${inspection?.tier || 'unsupported'}`}>
            {inspection?.provider || 'unknown'}
          </span>
          <span className="pill subtle">{savedCount} saved</span>
        </div>
        {inspection && (
          <div className="meta">
            <strong>{inspection.title}</strong>
            <span>{inspection.domain}</span>
            <small>{inspection.notes[0]}</small>
          </div>
        )}
        <button className="primary" onClick={() => void handleCapture()}>
          Capture visible chat
        </button>
        <button
          className="ghost"
          onClick={() => void browser.runtime.sendMessage({ type: 'open-dashboard' })}
        >
          Open dashboard
        </button>
      </section>

      <section className="stack form-panel">
        <label>
          <span>Company</span>
          <input
            value={form.companyName}
            onChange={(event) => setForm({ ...form, companyName: event.target.value })}
          />
        </label>
        <label>
          <span>Promised outcome</span>
          <textarea
            rows={3}
            value={form.promisedOutcome}
            onChange={(event) => setForm({ ...form, promisedOutcome: event.target.value })}
            placeholder="Refund of $39, replacement shipment, callback within 48 hours..."
          />
        </label>
        <div className="grid">
          <label>
            <span>Case ID</span>
            <input
              value={form.caseId}
              onChange={(event) => setForm({ ...form, caseId: event.target.value })}
            />
          </label>
          <label>
            <span>Order ID</span>
            <input
              value={form.orderId}
              onChange={(event) => setForm({ ...form, orderId: event.target.value })}
            />
          </label>
        </div>
        <div className="grid">
          <label>
            <span>Amount</span>
            <input
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              placeholder="$39.99"
            />
          </label>
          <label>
            <span>Follow up date</span>
            <input
              type="date"
              value={form.followUpDate}
              onChange={(event) => setForm({ ...form, followUpDate: event.target.value })}
            />
          </label>
        </div>
        <label>
          <span>Promise summary</span>
          <textarea
            rows={4}
            value={form.promiseSummary}
            onChange={(event) => setForm({ ...form, promiseSummary: event.target.value })}
            placeholder="Short summary of the captured conversation..."
          />
        </label>
        <button className="primary" disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Saving...' : 'Save support case'}
        </button>
      </section>

      {capture && (
        <section className="stack transcript-panel">
          <div className="panel-heading">
            <strong>Visible transcript preview</strong>
            <span>{capture.extraction.limited ? 'Partial capture' : 'Structured capture'}</span>
          </div>
          {transcriptSnippet.length ? (
            <ul className="message-list">
              {transcriptSnippet.map((message, index) => (
                <li key={`${message.text}-${index}`}>
                  <small>{message.speaker}</small>
                  <p>{message.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Transcript extraction was limited on this page. The screenshot was still captured.
            </p>
          )}
        </section>
      )}

      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}

export default App;

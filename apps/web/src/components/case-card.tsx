type CaseCardProps = {
  company: string;
  provider: string;
  promise: string;
  summary: string;
  followUp: string;
  status: string;
  amount: string;
};

export function CaseCard({
  company,
  provider,
  promise,
  summary,
  followUp,
  status,
  amount,
}: CaseCardProps) {
  return (
    <article className="case-card">
      <div className="case-card__top">
        <div>
          <p className="case-card__company">{company}</p>
          <h3>{promise}</h3>
        </div>
        <div className="case-card__badges">
          <span className="case-card__provider">{provider}</span>
          <span className={`status-pill status-pill--${status}`}>{status}</span>
        </div>
      </div>
      <p className="case-card__summary">{summary}</p>
      <div className="case-card__meta">
        <div>
          <span className="case-card__meta-label">Amount</span>
          <strong>{amount}</strong>
        </div>
        <div>
          <span className="case-card__meta-label">Follow up</span>
          <strong>{followUp}</strong>
        </div>
      </div>
    </article>
  );
}

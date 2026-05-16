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
        <span className={`status-pill status-pill--${status}`}>{status}</span>
      </div>
      <p className="case-card__summary">{summary}</p>
      <div className="case-card__meta">
        <span>{provider}</span>
        <span>{amount}</span>
        <span>Follow up {followUp}</span>
      </div>
    </article>
  );
}

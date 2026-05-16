type CaseItem = {
  id: string;
  company: string;
  provider: string;
  promise: string;
  summary: string;
  followUp: string;
  status: string;
  amount: string;
};

type CaseListProps = {
  items: CaseItem[];
};

export function CaseList({ items }: CaseListProps) {
  return (
    <div className="case-list">
      <div className="case-list__header" role="row">
        <span>Case</span>
        <span>Provider</span>
        <span>Amount</span>
        <span>Follow up</span>
        <span>Status</span>
      </div>

      <div className="case-list__body">
        {items.map((item) => (
          <article key={item.id} className="case-list__row">
            <div className="case-list__main">
              <strong>{item.company}</strong>
              <h3>{item.promise}</h3>
              <p>{item.summary}</p>
            </div>
            <span className="case-list__chip">{item.provider}</span>
            <strong>{item.amount}</strong>
            <strong>{item.followUp}</strong>
            <span className={`status-pill status-pill--${item.status}`}>{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

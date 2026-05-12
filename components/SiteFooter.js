export default function SiteFooter({ cms = {} }) {
  const footer = cms.footer || {};
  const branches = cms.contact?.sections?.find(s => s.type === "branches")?.branches || [];
  return (
    <footer className="mainFooter">
      <div>
        <b>{footer.title || "NABET PARIS"}</b>
        <span>{footer.text}</span>
      </div>

      {footer.showBranches && (
        <div className="footerBranches">
          <h3>הסניפים שלנו</h3>
          {branches.map((b, i) => (
            <a key={i} href={b.map} target="_blank" rel="noopener">
              <b>{b.name}</b>
              {b.phone ? <span>{b.phone}</span> : null}
            </a>
          ))}
        </div>
      )}

      <div className="footerLinks">
        {(footer.links || []).map((l, i) => <a key={i} href={l.url}>{l.label}</a>)}
      </div>
    
      <div className="socialFooter">
        <a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.google.com/search?q=NABET+PARIS" target="_blank" rel="noopener">Google</a>
      </div>
    </footer>
  );
}
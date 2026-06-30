interface Props {
  supportingEvidence: string[];
  counterEvidence: string[];
}

export function EvidenceDrawer({ supportingEvidence, counterEvidence }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <section>
        <h4 className="mb-2 font-medium text-green-600 uppercase tracking-wider text-[10px]">
          Supporting Evidence
        </h4>
        {supportingEvidence.length === 0 ? (
          <p className="text-zinc-600 italic">No supporting evidence found.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {supportingEvidence.map((e, i) => (
              <li key={i} className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-300 leading-relaxed">
                <span className="text-green-700 mr-1.5 select-none">"</span>
                {e}
                <span className="text-green-700 ml-0.5 select-none">"</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="mb-2 font-medium text-red-700 uppercase tracking-wider text-[10px]">
          Counter-Evidence
        </h4>
        {counterEvidence.length === 0 ? (
          <p className="text-zinc-600 italic">No counter-evidence found.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {counterEvidence.map((e, i) => (
              <li key={i} className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-300 leading-relaxed">
                <span className="text-red-800 mr-1.5 select-none">"</span>
                {e}
                <span className="text-red-800 ml-0.5 select-none">"</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

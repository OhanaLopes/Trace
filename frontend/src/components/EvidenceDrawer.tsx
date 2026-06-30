interface Props {
  supportingEvidence: string[];
  counterEvidence: string[];
}

export function EvidenceDrawer({ supportingEvidence, counterEvidence }: Props) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <section>
        <h4 className="mb-2 font-medium text-zinc-400 uppercase tracking-wide text-xs">
          Supporting Evidence
        </h4>
        {supportingEvidence.length === 0 ? (
          <p className="text-zinc-500 italic">No supporting evidence found.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {supportingEvidence.map((e, i) => (
              <li key={i} className="border-l-2 border-green-600 pl-3 text-zinc-300">
                {e}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="mb-2 font-medium text-zinc-400 uppercase tracking-wide text-xs">
          Counter-Evidence
        </h4>
        {counterEvidence.length === 0 ? (
          <p className="text-zinc-500 italic">No counter-evidence found.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {counterEvidence.map((e, i) => (
              <li key={i} className="border-l-2 border-red-600 pl-3 text-zinc-300">
                {e}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

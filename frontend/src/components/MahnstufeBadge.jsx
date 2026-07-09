export default function MahnstufeBadge({ stufe }) {
  if (stufe === 0) return <span className="badge badge--none">Keine</span>;
  if (stufe === 1) return <span className="badge badge--stufe1">Stufe 1</span>;
  if (stufe === 2) return <span className="badge badge--stufe2">Stufe 2</span>;
  return <span className="badge badge--stufe3">Stufe 3</span>;
}

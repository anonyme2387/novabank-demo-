import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 font-bold text-night">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-night text-white shadow-premium">N</span>
      <span>NovaBank</span>
    </Link>
  );
}

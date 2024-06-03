export function WikiTitle({ title }: { title: string }) {
  return (
    <div
      className="w-screen origin-bottom-left rotate-90 bg-white pb-1.5 text-lg font-medium"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}

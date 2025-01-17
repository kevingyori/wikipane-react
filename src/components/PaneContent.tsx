export function PaneContent({ title }: { title: string }) {
  return (
    <div className="scroll-y h-[calc(100vh-20px)] w-[650px] min-w-[650px] overflow-x-hidden overflow-y-scroll py-3 pr-3 scrollbar-thin">
      {title}
      Content here
    </div>
  );
}

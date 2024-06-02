import { Search, Settings } from "lucide-react";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

function IconWrapper({
  children,
  ...args
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <div
      className="rounded-full border bg-white p-4 text-gray-900 transition-shadow duration-300 hover:cursor-pointer hover:shadow-lg"
      {...args}
    >
      {children}
    </div>
  );
}

export function Options({
  setSearchOpen,
}: {
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [open, setOpen] = useState(false);
  const [, startTranstion] = useTransition();

  const handleOnSearchClick = () => {
    startTranstion(() => {
      setSearchOpen((prev) => !prev);
    });
  };

  return (
    <>
      {createPortal(
        <div className="absolute bottom-4 right-3 flex flex-col-reverse gap-3 opacity-50 transition-all delay-500 duration-500 hover:opacity-100 hover:delay-0">
          <IconWrapper onClick={() => setOpen((p: boolean) => !p)}>
            <Settings />
          </IconWrapper>
          {open ? (
            <div className="">
              <IconWrapper>
                <Search onClick={handleOnSearchClick} />
              </IconWrapper>
            </div>
          ) : null}
        </div>,
        document.body,
      )}
    </>
  );
}

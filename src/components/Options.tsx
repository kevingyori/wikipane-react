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
      className="text-gray-900 hover:cursor-pointer rounded-full p-4 bg-white transition-shadow hover:shadow-lg duration-300 border"
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
        <div className="absolute bottom-4 right-3 flex gap-3 flex-col-reverse opacity-50 hover:delay-0 delay-500 hover:opacity-100 transition-all duration-500">
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

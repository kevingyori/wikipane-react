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
      className="opacity-25 hover:opacity-100 transition-all hover:cursor-pointer rounded-full z-50 p-3 bg-white hover:shadow-lg"
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
    <div>
      {createPortal(
        <div className="absolute bottom-4 right-3 flex gap-3 flex-col-reverse">
          <IconWrapper onClick={() => setOpen((p: boolean) => !p)}>
            <Settings className="text-gray-900 " />
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
    </div>
  );
}

import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open: controlledOpen, 
  onOpenChange, 
  children 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => handleOpenChange(false)}
          />
          {/* Dialog content will be rendered by DialogContent */}
        </div>
      )}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  asChild = false, 
  children 
}) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  const handleClick = () => {
    context.onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick();
      },
    });
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
};

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  className = '', 
  children 
}) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within Dialog');

  if (!context.open) return null;

  return (
    <div className={`
      relative z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6
      animate-in fade-in-0 zoom-in-95 duration-200
      ${className}
    `}>
      <button
        onClick={() => context.onOpenChange(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  className = '', 
  children 
}) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ 
  className = '', 
  children 
}) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ 
  className = '', 
  children 
}) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// Card component - the main container
export const Card: React.FC<CardProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// CardHeader component - typically contains the title/heading
export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 pb-2 border-b border-gray-100 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

// CardTitle component - used for the card's heading
export const CardTitle: React.FC<CardTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={`text-xl font-semibold leading-none tracking-tight text-gray-900 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// CardContent component - contains the main content of the card
export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={`p-6 pt-4 text-gray-700 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// Optional: CardFooter component - for actions or additional info at the bottom
export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-end gap-2 p-6 pt-0 border-t border-gray-100 mt-4 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

// Export all components

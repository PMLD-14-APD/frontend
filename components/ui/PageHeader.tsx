interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-semibold text-zinc-900">
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      )}
    </header>
  );
}

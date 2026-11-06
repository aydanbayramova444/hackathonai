import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { PageHeader } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

export default function ComingSoon({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
          <Hammer className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold">This section is being built</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">It’s part of the next build steps. Everything on the dashboard is already live.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </>
  );
}

import EventCard, { type EventCardProps } from "./EventCard";

export interface EventListProps {
  events: EventCardProps[];
}

export default function EventList({ events }: EventListProps) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-300">
        Ainda não há eventos disponíveis. Volte em breve!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}

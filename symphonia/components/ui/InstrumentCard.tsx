import { instruments } from "@/hooks/instrument";

export default function InstrumentCard() {
  return (
    // "grid-cols-1" pour mobile, "md:grid-cols-2" pour tablette, "lg:grid-cols-3" pour desktop
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 " >
      {instruments.map((inst, index) => (
        <div
          key={inst.id || index}
          className="relative h-40 rounded-xl overflow-hidden bg-neutral-primary-soft border border-default group cursor-pointer"
        >
          <img
            src={inst.image}
            className="absolute inset-0 object-cover w-full h-full transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 transition-opacity">
            <h5 className="text-white text-sm font-bold">{inst.name}</h5>
            <p className="hidden group-hover:block text-white/90 text-[10px] mt-1 line-clamp-2">
              {inst.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

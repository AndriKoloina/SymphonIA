import { instruments } from "@/hooks/instrument";

export default function InstrumentCard() {
  return (
    
    <div className="w-full pl-0 ml-0 flex justify-center items-center">
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 p-3 md:p-5 w-full max-w-6xl mx-auto">
        {instruments.map((inst, index) => (
          <div 
            key={inst.id || index}
            className="p-[1px] rounded-xl bg-gradient-to-br from-purple-600 via-transparent to-pink-500 hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg w-full"
          >
            <div
              className="relative h-40 rounded-[inherit] overflow-hidden bg-neutral-primary-soft group cursor-pointer"
            >
              <img
                src={inst.image}
                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                alt={inst.name}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h5 className="text-white text-sm font-bold tracking-wide">{inst.name}</h5>
                
                <p className="max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 text-white/80 text-[10px] mt-2 line-clamp-2 ease-in-out">
                  {inst.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
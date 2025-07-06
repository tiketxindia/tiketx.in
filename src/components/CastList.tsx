
interface CastMember {
  id: number;
  name: string;
  role: string;
  photo?: string;
}

interface CastListProps {
  cast: CastMember[];
  crew: CastMember[];
}

export const CastList = ({ cast, crew }: CastListProps) => {
  return (
    <div className="px-2 sm:px-6">
      {/* Crew */}
      {crew.length > 0 && (
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-semibold mb-2 text-left">Crew</h3>
          <div className="flex flex-row gap-4 overflow-x-auto whitespace-nowrap w-full pb-2 scrollbar-hide">
            {crew.map((member) => (
              <div key={member.id} className="text-center flex-shrink-0" style={{ minWidth: '90px' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-1 bg-transparent">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <img
                      src="/mobile-logo.png"
                      alt="Default profile"
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <div className="flex flex-col items-start mt-6">
          <h3 className="text-lg font-semibold mb-2 text-left">Cast</h3>
          <div className="flex flex-row gap-4 overflow-x-auto whitespace-nowrap w-full pb-2 scrollbar-hide">
            {cast.slice(0, 10).map((member) => (
              <div key={member.id} className="text-center flex-shrink-0" style={{ minWidth: '90px' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-1 bg-transparent">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <img
                      src="/mobile-logo.png"
                      alt="Default profile"
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

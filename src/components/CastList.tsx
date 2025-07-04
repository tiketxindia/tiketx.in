
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
    <div className="px-6 space-y-6">
      {/* Crew */}
      {crew.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Crew</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {crew.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-16 h-16 bg-tiketx-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {member.name.charAt(0)}
                    </span>
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
        <div>
          <h3 className="text-lg font-semibold mb-4">Cast</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cast.slice(0, 10).map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-16 h-16 bg-tiketx-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {member.name.charAt(0)}
                    </span>
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

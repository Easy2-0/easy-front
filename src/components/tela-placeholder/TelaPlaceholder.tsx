interface Props {
  mensagem?: string;
}

const TelaPlaceholder = ({ mensagem = 'Em construção...' }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2bb39a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-white/60 text-sm">{mensagem}</p>
    </div>
  );
};

export default TelaPlaceholder;



const SpeechWave = ({ isPlaying = false }) => (
  <div className="speech-wave-container">
    <div className={`speech-wave ${isPlaying ? "active" : ""}`}>
      {[1, 2, 3].map((wave) => (
        <div key={wave} className="wave"></div>
      ))}
    </div>
  </div>
);

export default SpeechWave;


const PreLoader = () => {
  return (
    <div
      className="loader-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <img
        src="/assets/images/logo.png"
        alt="Chargement..."
        style={{ width: '150px', height: 'auto' }}
      />
    </div>
  );
};

export default PreLoader;
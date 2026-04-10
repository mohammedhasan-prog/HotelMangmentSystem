import { Scrollbars } from 'react-custom-scrollbars-2';

function AppScrollbar({ children }) {
  return (
    <Scrollbars
      autoHide
      autoHideTimeout={500}
      autoHideDuration={220}
      universal
      style={{ width: '100%', height: '100vh' }}
      renderTrackVertical={(props) => <div {...props} className="app-scrollbar-track" />}
      renderThumbVertical={(props) => <div {...props} className="app-scrollbar-thumb" />}
      renderView={(props) => <div {...props} className="app-scrollbar-view" />}
    >
      {children}
    </Scrollbars>
  );
}

export default AppScrollbar;

import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import AllRoutes from './Router';
import Launch from './Home/Launch';

function App() {
  const [launched, setLaunched] = useState(false);

  return (
    <div className='md:w-auto md:h-auto'>
      {!launched && <Launch onComplete={() => setLaunched(true)} />}
      <BrowserRouter>
        <AllRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
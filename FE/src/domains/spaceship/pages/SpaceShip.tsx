import SpaceShipComponents from '../components/SpaceShipComponent';
import SpaceShipContent from '../components/SpaceShipContent';
import '../themes/SpaceShip.css';
import { useEffect, useState } from 'react';

const SpaceShip = () => {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const animationCheck = localStorage.getItem('EnterSpaceShip');
    if (animationCheck === 'ok') {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 2000);
      localStorage.removeItem('EnterSpaceShip');
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {showFlash && <div className="flashEffect"></div>}
      <SpaceShipComponents>
        <SpaceShipContent />
      </SpaceShipComponents>
    </>
  );
};

export default SpaceShip;

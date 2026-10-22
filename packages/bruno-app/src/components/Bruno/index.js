import React from 'react';
// Inlined: the packaged app loads the web files from file://, where an emitted asset URL points at the disk root
import brunommerceIcon from 'assets/brunommerce-icon.png?inline';

const Bruno = ({ width }) => {
  return <img src={brunommerceIcon} width={width} height={width} alt="Brunommerce" />;
};

export default Bruno;

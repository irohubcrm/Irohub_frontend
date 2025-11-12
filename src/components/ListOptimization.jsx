
import React from 'react';
import { FixedSizeList as List } from 'react-window';

const largeData = new Array(10000).fill(null).map((_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

const Row = ({ index, style }) => (
  <div style={style}>Item {index}</div>
);

const ListOptimization = () => {
  const BeforeOptimization = () => (
    <div>
      <h2>Before Optimization</h2>
      <ul>
        {largeData.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );

  const AfterOptimization = () => (
    <div>
      <h2>After Optimization</h2>
      <List
        height={400}
        itemCount={largeData.length}
        itemSize={35}
        width={300}
      >
        {Row}
      </List>
    </div>
  );

  return (
    <div>
      <h1>List Optimization</h1>
      {/* <BeforeOptimization /> */}
      <AfterOptimization />
    </div>
  );
};

export default ListOptimization;

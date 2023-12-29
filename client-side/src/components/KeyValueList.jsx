import React from 'react';

const KeyValueList = ({ data }) => {
  // Mapping through the object keys and creating list elements for each key-value pair
  const keyValueElements = Object.keys(data).map((key) => (
    <li key={key}>
      <strong>{key}: </strong>
      {data[key]}
    </li>
  ));

  return (
    <div>
      <h2>Key-Value Pairs:</h2>
      <ul>
        {keyValueElements}
      </ul>
    </div>
  );
};

export default KeyValueList;

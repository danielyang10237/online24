import {React } from 'react';

const KeyValueList = ({ data }) => {
  // Mapping through the object keys and creating list elements for each key-value pair
  const keyValueElements = Object.keys(data).map((key) => (
    <li key={key}>
      <strong>{key}: </strong>
      {data[key]}
    </li>
  ));

  // useEffect(() => {
  //   console.log('data in KeyValueList', data);
  // }, [data]);

  return (
    <div>
      <h2>Cumulative Scores</h2>
      <ul>
        {keyValueElements}
      </ul>
    </div>
  );
};

export default KeyValueList;

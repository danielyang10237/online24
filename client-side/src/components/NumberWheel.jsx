import React, { useState, useEffect } from "react";

let operator = null;
let prevNumberValue = null;
let prevNumberIndex = null;

const NumberWheel = (props) => {
  const [numberOne, setNumberOne] = useState(null);
  const [numberTwo, setNumberTwo] = useState(null);
  const [numberThree, setNumberThree] = useState(null);
  const [numberFour, setNumberFour] = useState(null);

  useEffect(() => {
    if (props.numbers !== null) {
      resetNumbers();
    }
  }, [props.numbers]);

  const checkWin = () => {
    if (
      numberOne + numberTwo + numberThree + numberFour === 21 &&
      (numberOne === 24 ||
        numberTwo === 24 ||
        numberThree === 24 ||
        numberFour === 24)
    ) {
      props.isWin();
    }
  };

  useEffect(() => {
    checkWin();
  }, [numberOne, numberTwo, numberThree, numberFour]);

  function isNonIntegerDivision(dividend, divisor) {
    return dividend / divisor !== Math.floor(dividend / divisor);
  }

  const handleOperator = (selectedOperator) => {
    if (operator !== null) {
      operator = null;
      return;
    }
    if (prevNumberValue !== null && prevNumberIndex !== null) {
      operator = selectedOperator;
    }
  };

  const updateCalculation = (latterValue, latterIndex) => {

    // calculate the number from the user
    let calculatedNumber = 0;
    if (operator === "+") {
      calculatedNumber = prevNumberValue + latterValue;
    } else if (operator === "-") {
      calculatedNumber = prevNumberValue - latterValue;
    } else if (operator === "*") {
      calculatedNumber = prevNumberValue * latterValue;
    } else if (operator === "/") {
      if (isNonIntegerDivision(prevNumberValue, latterValue)) {
        console.log("non-integer division");
        operator = null;
        prevNumberValue = null;
        prevNumberIndex = null;
        return;
      }
      calculatedNumber = prevNumberValue / latterValue;
    } else {
      console.log("unknown operator");
    }

    // make the first number disappear
    switch (prevNumberIndex) {
      case 1:
        setNumberOne(-1);
        break;
      case 2:
        setNumberTwo(-1);
        break;
      case 3:
        setNumberThree(-1);
        break;
      case 4:
        setNumberFour(-1);
        break;
      default:
        console.log("unknown number prev");
        break;
    }
    prevNumberIndex = null;

    // the second number is the result of the calculation
    switch (latterIndex) {
      case 1:
        setNumberOne(calculatedNumber);
        break;
      case 2:
        setNumberTwo(calculatedNumber);
        break;
      case 3:
        setNumberThree(calculatedNumber);
        break;
      case 4:
        setNumberFour(calculatedNumber);
        break;
      default:
        console.log("unknown number latter");
        break;
    }
    operator = null;
    prevNumberValue = calculatedNumber;
    prevNumberIndex = latterIndex;
  };

  const handleNumber = (number, index) => {
    if (operator === null) {
      prevNumberValue = number;
      prevNumberIndex = index;
    } else {
      updateCalculation(number, index);
    }
  };

  const resetNumbers = () => {
    const numbers = props.numbers;
    setNumberOne(numbers[0]);
    setNumberTwo(numbers[1]);
    setNumberThree(numbers[2]);
    setNumberFour(numbers[3]);
    operator = null;
    prevNumberValue = null;
    prevNumberIndex = null;
  };

  return (
    <div>
      <h1>Each Number</h1>
      <h2>Options</h2>
      {numberOne > 0 ? (
        <button onClick={() => handleNumber(numberOne, 1)}>{numberOne}</button>
      ) : null}
      {numberTwo > 0 ? (
        <button onClick={() => handleNumber(numberTwo, 2)}>{numberTwo}</button>
      ) : null}
      {numberThree > 0 ? (
        <button onClick={() => handleNumber(numberThree, 3)}>
          {numberThree}
        </button>
      ) : null}
      {numberFour > 0 ? (
        <button onClick={() => handleNumber(numberFour, 4)}>
          {numberFour}
        </button>
      ) : null}
      <button onClick={() => handleOperator("+")}>+</button>
      <button onClick={() => handleOperator("-")}>-</button>
      <button onClick={() => handleOperator("*")}>*</button>
      <button onClick={() => handleOperator("/")}>/</button>
      <button onClick={() => resetNumbers()}>Reset</button>
    </div>
  );
};

export default NumberWheel;

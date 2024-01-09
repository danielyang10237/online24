import React, { useState, useEffect } from "react";
import "../css/numberWheel.css";

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

  const scrambleNumbers = () => {
    const numbers = props.numbers;
    const newNumbers = [];
    while (numbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      newNumbers.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1);
    }
    setNumberOne(newNumbers[0]);
    setNumberTwo(newNumbers[1]);
    setNumberThree(newNumbers[2]);
    setNumberFour(newNumbers[3]);
    numbers.push(newNumbers[0]);
    numbers.push(newNumbers[1]);
    numbers.push(newNumbers[2]);
    numbers.push(newNumbers[3]);
  };

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
    if (!prevNumberIndex) {
      return;
    }
    if (operator !== null) {
      deselectOperator(operator);
      operator = null;
    }
    operator = selectedOperator;
    selectOperator(selectedOperator);
  };

  const updateCalculation = (latterValue, latterIndex) => {
    deselectOperator(operator);
    addSelected(latterIndex);
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
        deselectOperator(operator);
        removeSelected(latterIndex);
        removeSelected(prevNumberIndex);
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

  const addSelected = (index) => {
    switch (index) {
      case 1:
        const firstNumber = document.getElementById("number1");
        firstNumber.classList.add("selected");
        break;
      case 2:
        const secondNumber = document.getElementById("number2");
        secondNumber.classList.add("selected");
        break;
      case 3:
        const thirdNumber = document.getElementById("number3");
        thirdNumber.classList.add("selected");
        break;
      case 4:
        const fourthNumber = document.getElementById("number4");
        fourthNumber.classList.add("selected");
        break;
    }
  };

  const removeSelected = (index) => {
    switch (index) {
      case 1:
        const firstNumber = document.getElementById("number1");
        firstNumber.classList.remove("selected");
        break;
      case 2:
        const secondNumber = document.getElementById("number2");
        secondNumber.classList.remove("selected");
        break;
      case 3:
        const thirdNumber = document.getElementById("number3");
        thirdNumber.classList.remove("selected");
        break;
      case 4:
        const fourthNumber = document.getElementById("number4");
        fourthNumber.classList.remove("selected");
        break;
    }
  };

  const selectOperator = (operator) => {
    switch (operator) {
      case "+":
        const plusOperator = document.getElementById("operator1");
        plusOperator.classList.add("selected");
        break;
      case "-":
        const minusOperator = document.getElementById("operator2");
        minusOperator.classList.add("selected");
        break;
      case "*":
        const multiplyOperator = document.getElementById("operator3");
        multiplyOperator.classList.add("selected");
        break;
      case "/":
        const divideOperator = document.getElementById("operator4");
        divideOperator.classList.add("selected");
        break;
    }
  };

  const deselectOperator = (operator) => {
    switch (operator) {
      case "+":
        const plusOperator = document.getElementById("operator1");
        plusOperator.classList.remove("selected");
        break;
      case "-":
        const minusOperator = document.getElementById("operator2");
        minusOperator.classList.remove("selected");
        break;
      case "*":
        const multiplyOperator = document.getElementById("operator3");
        multiplyOperator.classList.remove("selected");
        break;
      case "/":
        const divideOperator = document.getElementById("operator4");
        divideOperator.classList.remove("selected");
        break;
    }
  };

  const handleNumber = (number, index) => {
    if (prevNumberIndex === index) {
      prevNumberValue = null;
      prevNumberIndex = null;
      if (operator) {
        deselectOperator(operator);
      }
      removeSelected(index);
      operator = null;  
      return;
    }

    if (operator === null) {
      if (prevNumberIndex) {
        removeSelected(prevNumberIndex);
      }
      prevNumberValue = number;
      prevNumberIndex = index;
      addSelected(prevNumberIndex);
    } else {
      if (index === prevNumberIndex) {
        removeSelected(index);
        prevNumberValue = null;
        prevNumberIndex = null;
        return;
      }
      updateCalculation(number, index);
    }
  };

  const resetNumbers = () => {
    const numbers = props.numbers;
    setNumberOne(numbers[0]);
    setNumberTwo(numbers[1]);
    setNumberThree(numbers[2]);
    setNumberFour(numbers[3]);
    if (operator) {
      deselectOperator(operator);
    }
    if (prevNumberIndex) {
      removeSelected(prevNumberIndex);
    }
    operator = null;
    prevNumberValue = null;
    prevNumberIndex = null;
  };

  return (
    <div className="game-container">
      <div className="row row-1">
        <button
          className={`btn number ${numberOne > 0 ? "" : "hidden"}`}
          id="number1"
          onClick={() => handleNumber(numberOne, 1)}
        >
          {numberOne}
        </button>
      </div>
      <div className="row row-2">
        <button
          id="number2"
          className={`btn number ${numberTwo > 0 ? "" : "hidden"}`}
          onClick={() => handleNumber(numberTwo, 2)}
        >
          {numberTwo}
        </button>
        <button
          id="number3"
          className={`btn number ${numberThree > 0 ? "" : "hidden"}`}
          onClick={() => handleNumber(numberThree, 3)}
        >
          {numberThree}
        </button>
      </div>
      <div className="row row-3">
        <button
          id="number4"
          className={`btn number ${numberFour > 0 ? "" : "hidden"}`}
          onClick={() => handleNumber(numberFour, 4)}
        >
          {numberFour}
        </button>
      </div>
      <div className="row row-4">
        <button
          id="operator1"
          className="btn operator"
          onClick={() => handleOperator("+")}
        >
          +
        </button>
        <button
          id="operator2"
          className="btn operator"
          onClick={() => handleOperator("-")}
        >
          -
        </button>
        <button
          id="operator3"
          className="btn operator"
          onClick={() => handleOperator("*")}
        >
          *
        </button>
        <button
          id="operator4"
          className="btn operator"
          onClick={() => handleOperator("/")}
        >
          /
        </button>
      </div>
      <div className="row row-5">
        <button className="special-button reset" onClick={() => resetNumbers()}>
          Reset
        </button>
        <button
          className="special-button scramble"
          onClick={() => scrambleNumbers()}
        >
          Scramble
        </button>
      </div>
    </div>
  );
};

export default NumberWheel;

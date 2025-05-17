"use client";

import { useState } from "react";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(value ? String(-value) : "0");
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = () => {
    const secondOperand = parseFloat(display);

    if (operator === "+") {
      return firstOperand! + secondOperand;
    } else if (operator === "-") {
      return firstOperand! - secondOperand;
    } else if (operator === "*") {
      return firstOperand! * secondOperand;
    } else if (operator === "/") {
      return firstOperand! / secondOperand;
    }

    return secondOperand;
  };

  const handleEquals = () => {
    if (!operator || firstOperand === null) return;

    const result = performCalculation();
    setDisplay(String(result));
    setFirstOperand(result);
    setOperator(null);
    setWaitingForSecondOperand(true);
  };

  const handlePercent = () => {
    const currentValue = parseFloat(display);
    const percentValue = currentValue / 100;
    setDisplay(String(percentValue));
  };

  return (
    <div className="calculator-app">
      <div className="calculator-display">{display}</div>
      <div className="calculator-buttons">
        <button className="calculator-button" onClick={() => clearDisplay()}>
          C
        </button>
        <button className="calculator-button" onClick={() => toggleSign()}>
          +/-
        </button>
        <button className="calculator-button" onClick={() => handlePercent()}>
          %
        </button>
        <button
          className="calculator-button calculator-operator"
          onClick={() => handleOperator("/")}
        >
          ÷
        </button>

        <button className="calculator-button" onClick={() => inputDigit("7")}>
          7
        </button>
        <button className="calculator-button" onClick={() => inputDigit("8")}>
          8
        </button>
        <button className="calculator-button" onClick={() => inputDigit("9")}>
          9
        </button>
        <button
          className="calculator-button calculator-operator"
          onClick={() => handleOperator("*")}
        >
          ×
        </button>

        <button className="calculator-button" onClick={() => inputDigit("4")}>
          4
        </button>
        <button className="calculator-button" onClick={() => inputDigit("5")}>
          5
        </button>
        <button className="calculator-button" onClick={() => inputDigit("6")}>
          6
        </button>
        <button
          className="calculator-button calculator-operator"
          onClick={() => handleOperator("-")}
        >
          −
        </button>

        <button className="calculator-button" onClick={() => inputDigit("1")}>
          1
        </button>
        <button className="calculator-button" onClick={() => inputDigit("2")}>
          2
        </button>
        <button className="calculator-button" onClick={() => inputDigit("3")}>
          3
        </button>
        <button
          className="calculator-button calculator-operator"
          onClick={() => handleOperator("+")}
        >
          +
        </button>

        <button className="calculator-button" onClick={() => inputDigit("0")}>
          0
        </button>
        <button className="calculator-button" onClick={() => inputDecimal()}>
          .
        </button>
        <button className="calculator-button" onClick={() => handleEquals()}>
          =
        </button>
      </div>
    </div>
  );
}

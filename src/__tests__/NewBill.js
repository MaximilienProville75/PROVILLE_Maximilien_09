/**
 * @jest-environment jsdom
 */

import userEvent from "@testing-library/user-event";
import { fireEvent, screen } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockedstore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then handleSubmit is called", () => {
      const mock = jest.fn();
      jest.spyOn(NewBill.prototype, "handleSubmit").mockImplementation(mock);
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "test@test.com",
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const form = document.querySelector(`form[data-testid="form-new-bill"`);
      expect(form).toBeTruthy();
      fireEvent.submit(form);
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When i click on submit", () => {
    test("Then a new bill should be created", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@test.com",
      })
    );
    const mock = jest.fn();
    jest.spyOn(NewBill.prototype, "updateBill").mockImplementation(mock);

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBillUI = new NewBill({
      document,
      onNavigate: () => {},
      store: null,
      localStorage: window.localStorage,
    });
    newBillUI.fileUrl = "https://www.test.test";
    newBillUI.fileName = "test.test";

    const et = screen.getByTestId("expense-type");
    et.value = "Transports";

    const en = screen.getByTestId("expense-name");
    en.value = "test bill";

    const amount = screen.getByTestId("amount");
    amount.value = "100";

    const date = screen.getByTestId("datepicker");
    date.value = "2021-06-07";

    const vat = screen.getByTestId("vat");
    vat.value = "";

    const pvt = screen.getByTestId("pct");
    pvt.value = "20";

    const commentary = screen.getByTestId("commentary");
    commentary.value = "test commentary";

    const form = document.querySelector(`form[data-testid="form-new-bill"`);

    const customEvent = {
      preventDefault: jest.fn(),
      target: form,
    };
    newBillUI.handleSubmit(customEvent);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith({
      amount: 100,
      commentary: "test commentary",
      date: "2021-06-07",
      email: "employee@test.com",
      fileName: "test.test",
      fileUrl: "https://www.test.test",
      name: "test bill",
      pct: 20,
      status: "pending",
      type: "Transports",
      vat: "",
    });
  });
  describe("When i select a file", () => {
    test("then handleChangeFile is called", () => {
      //PREPARATION
      const mock = jest.fn();
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      jest
        .spyOn(NewBill.prototype, "handleChangeFile")
        .mockImplementation(mock);
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const html = NewBillUI();
      document.body.innerHTML = html;

      new NewBill({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });

      const fileInput = document.querySelector(`input[data-testid="file"]`);

      expect(fileInput).toBeTruthy();
      userEvent.upload(fileInput, file);
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When I select a file", () => {
    test("It should change file value if the file type is wrong", () => {
      const mock = jest.fn();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const myNewBill = new NewBill({
        document,
        onNavigate,
        store: mockedstore,
        localStorage: null,
      });
      const fileInput = document.querySelector(`input[data-testid="file"]`);
      const customEvent = {
        preventDefault: jest.fn(),
        target: fileInput,
      };
      const badFile = new File(["hello"], "hello.png", { type: "image/png" });
      fileInput.files = [badFile];
      myNewBill.handleChangeFile(customEvent);
      expect(screen.getByTestId("file").value).toBe("");
      expect(myNewBill.fileUrl).toBe(null);
      expect(myNewBill.fileName).toBe(null);
    });
  });
});

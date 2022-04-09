/**
 * @jest-environment jsdom
 */

import userEvent from "@testing-library/user-event";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import mockedstore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { ROUTES_PATH } from "../constants/routes";
import router from "../app/Router";

jest.mock("../app/store", () => mockedstore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then handleSubmit is called", () => {
      const mock = jest.fn();
      const spy = jest
        .spyOn(NewBill.prototype, "handleSubmit")
        .mockImplementation(mock);
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
      spy.mockRestore();
    });
  });
  describe("When i click on submit", () => {
    test("The bill should be updated", () => {
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
    const spy = jest
      .spyOn(NewBill.prototype, "updateBill")
      .mockImplementation(mock);

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBillContainer = new NewBill({
      document,
      onNavigate: () => {},
      store: null,
      localStorage: window.localStorage,
    });
    newBillContainer.fileUrl = "https://www.test.test";
    newBillContainer.fileName = "test.test";

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
    newBillContainer.handleSubmit(customEvent);
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
    spy.mockRestore();
  });
  describe("When i select a file", () => {
    test("then handleChangeFile is called", () => {
      const mock = jest.fn();

      const file = new File(["hello"], "hello.png", { type: "image/png" });
      const spy = jest
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
      spy.mockRestore();
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

      const badFile = new File(["hello"], "hello.png", { type: "image/png" });

      const fileInput = document.querySelector(`input[data-testid="file"]`);
      const customEvent = {
        preventDefault: jest.fn(),
        target: {
          files: [badFile],
          value: "hello.png",
        },
      };

      myNewBill.handleChangeFile(customEvent);
      expect(myNewBill.fileUrl).toBe(null);
      expect(myNewBill.fileName).toBe(null);
    });
  });
});

test("NewBill integration test", async () => {
  mockedstore.bills().create.mockClear();
  document.body.innerHTML = "";
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
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
  await waitFor(() => screen.getByText(/Envoyer une note de frais/));
  const fileInput = screen.getByTestId("file");
  expect(fileInput).toBeTruthy();
  const mockFile = new File(["test.png"], "test.png", {
    type: "image/png",
  });
  fireEvent.change(fileInput, {
    target: {
      files: [mockFile],
    },
  });
  const mockFormData = new FormData();
  mockFormData.append("file", mockFile);
  mockFormData.append("email", "test@test.com");
  await new Promise(process.nextTick);
  expect(mockedstore.bills().create).toHaveBeenCalledTimes(1);
});

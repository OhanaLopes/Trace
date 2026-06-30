import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StoryInput } from "../components/StoryInput";

describe("StoryInput", () => {
  it("renders a textarea and a submit button", () => {
    render(<StoryInput onSubmit={vi.fn()} status="idle" />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("submit button is disabled when textarea is empty", () => {
    render(<StoryInput onSubmit={vi.fn()} status="idle" />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("submit button is enabled when textarea has content", () => {
    render(<StoryInput onSubmit={vi.fn()} status="idle" />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "As a user..." } });

    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("calls onSubmit with raw text when form is submitted", () => {
    const onSubmit = vi.fn();
    render(<StoryInput onSubmit={onSubmit} status="idle" />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "My story" } });
    fireEvent.click(screen.getByRole("button"));

    expect(onSubmit).toHaveBeenCalledWith({ raw: "My story" });
  });

  it("submit button is disabled when status is running", () => {
    render(<StoryInput onSubmit={vi.fn()} status="running" />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "My story" } });

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading text on button when status is running", () => {
    render(<StoryInput onSubmit={vi.fn()} status="running" />);

    expect(screen.getByRole("button")).toHaveTextContent(/analyzing/i);
  });
});

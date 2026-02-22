import { describe, it, expect } from "vitest";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";

const execFile = promisify(execFileCb);
const CLI = join(import.meta.dirname, "..", "dist", "cli.js");

describe("CLI", () => {
  it("shows help", async () => {
    const { stdout } = await execFile("node", [CLI, "--help"]);
    expect(stdout).toContain("og-image");
    expect(stdout).toContain("generate");
  });

  it("generates a PNG with --name", async () => {
    const output = join(tmpdir(), `cli-test-${Date.now()}.png`);
    const { stdout } = await execFile("node", [
      CLI,
      "generate",
      "--name",
      "CLI Test",
      "--tagline",
      "Testing the CLI",
      "-o",
      output,
    ]);

    expect(stdout).toContain("PNG:");
    expect(existsSync(output)).toBe(true);
    unlinkSync(output);
  });

  it("generates from a config file", async () => {
    const configPath = join(tmpdir(), `cli-test-config-${Date.now()}.json`);
    const output = join(tmpdir(), `cli-test-config-${Date.now()}.png`);
    const config = {
      name: "Config Test",
      tagline: "From config file",
      features: ["A", "B"],
    };
    await writeFile(configPath, JSON.stringify(config), "utf-8");

    const { stdout } = await execFile("node", [
      CLI,
      "generate",
      "--config",
      configPath,
      "-o",
      output,
    ]);

    expect(stdout).toContain("PNG:");
    expect(existsSync(output)).toBe(true);

    unlinkSync(output);
    await unlink(configPath);
  });

  it("outputs meta tags with --meta", async () => {
    const output = join(tmpdir(), `cli-test-meta-${Date.now()}.png`);
    const { stdout } = await execFile("node", [
      CLI,
      "generate",
      "--name",
      "Meta Test",
      "--meta",
      "--image-url",
      "https://example.com/og.png",
      "-o",
      output,
    ]);

    expect(stdout).toContain("og:title");
    expect(stdout).toContain("twitter:card");
    unlinkSync(output);
  });

  it("errors when no name or config is provided", async () => {
    try {
      await execFile("node", [CLI, "generate"]);
      expect.unreachable("Should have thrown");
    } catch (err: unknown) {
      const error = err as { stderr?: string; stdout?: string };
      expect(error.stderr || error.stdout).toContain("--name is required");
    }
  });
});

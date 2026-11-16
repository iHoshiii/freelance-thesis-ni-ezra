"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { Icon } from "./dashboard-icon";
import { DeviceCallouts, type DeviceModelReadings } from "./device-callouts";

const orbit = "25deg 40deg 85%";
const target = "auto 0.025m auto";
const poster = "/models/compact-breadboard.png";

export function DeviceModel({ readings }: { readings: DeviceModelReadings }) {
  const host = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<ModelViewerElement | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let element: ModelViewerElement | null = null;
    const finish = (next: "ready" | "error") => {
      if (!cancelled) setState(next);
      clearTimeout(timer);
    };
    const loaded = () => finish("ready");
    const failed = () => finish("error");
    const timer = window.setTimeout(failed, 45000);
    void import("@google/model-viewer").then(() => {
      if (cancelled) return;
      element = document.createElement("model-viewer");
      const attributes = {
        src: `/models/compact-breadboard.glb${attempt ? `?retry=${Date.now()}` : ""}`, alt: "Interactive compact breadboard device. Drag or use arrow keys to rotate. Pinch or scroll to zoom.",
        "camera-controls": "", "camera-orbit": orbit, "camera-target": target, "field-of-view": "30deg",
        "min-camera-orbit": "auto 10deg 40%", "max-camera-orbit": "auto 170deg 200%",
        "disable-pan": "", "disable-tap": "", "interaction-prompt": "none",
        "environment-image": "neutral", "tone-mapping": "neutral", "shadow-intensity": ".5",
        "interpolation-decay": matchMedia("(prefers-reduced-motion: reduce)").matches ? "0" : "100", loading: "eager",
      };
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      element.addEventListener("load", loaded);
      element.addEventListener("error", failed);
      container.appendChild(element);
      setViewer(element);
    }).catch(failed);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      element?.removeEventListener("load", loaded);
      element?.removeEventListener("error", failed);
      element?.remove();
    };
  }, [attempt]);
  function reset() {
    const element = host.current?.querySelector("model-viewer");
    if (!element?.loaded) return;
    element.cameraOrbit = orbit;
    element.cameraTarget = target;
    element.fieldOfView = "30deg";
    element.requestUpdate("cameraOrbit");
    element.requestUpdate("cameraTarget");
    element.requestUpdate("fieldOfView");
    element.jumpCameraToGoal();
  }
  return <div className={`device-model device-model-annotated device-model-${state}`} aria-busy={state === "loading"}>
    <div className="device-model-canvas" ref={host} />
    {state !== "ready" && <Image className="device-model-poster" src={poster} alt="Compact breadboard prototype" fill sizes="(max-width: 1000px) 100vw, 60vw" unoptimized />}
    <DeviceCallouts viewer={state === "ready" ? viewer : null} {...readings} />
    <div className="device-model-toolbar"><button className="icon-button" type="button" onClick={reset} disabled={state !== "ready"} aria-label="Reset 3D view" title="Reset view"><Icon name="refresh" /></button></div>
    {state === "ready" ? <span className="device-model-hint">Drag to rotate</span>
      : <div className="device-model-message" role="status">{state === "loading" ? <><span className="is-spinning"><Icon name="refresh" /></span>Loading 3D</> : <><span>3D unavailable</span><button type="button" onClick={() => { setState("loading"); setAttempt((value) => value + 1); }}>Retry</button></>}</div>}
  </div>;
}

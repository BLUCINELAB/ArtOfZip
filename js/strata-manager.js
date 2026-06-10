/*
  Strata Manager
  Genera e renderizza carote di sedimento procedurali.
  Ogni strato conserva il seed necessario per aprire la sezione sottile.
*/

(function () {
  "use strict";

  class StrataManager {
    constructor(container) {
      this.container = container;
      this.maxCores = 3;
      this.activeCores = [];
      this.depthName = "quaternario";
      this.scaleName = "lineare";
    }

    setDepth(depthName) {
      this.depthName = depthName || "quaternario";
    }

    setScale(scaleName) {
      this.scaleName = scaleName || "lineare";
    }

    generateCore(x, y) {
      const surface = document.getElementById("surface");
      const width = surface ? surface.clientWidth : window.innerWidth;
      const height = surface ? surface.clientHeight : window.innerHeight;

      const seed = window.PsychoCore.seedFromCoordinates(x, y, this.depthName, this.scaleName);
      const random = window.PsychoCore.mulberry32(seed);
      const map = window.PsychoCore.mapCoordinatesToTemporalDepth(
        x,
        y,
        width,
        height,
        this.depthName,
        this.scaleName
      );

      const layerNames = Object.keys(window.PsychoCore.coreLayerPalettes);
      const layers = [];
      let totalHeight = 0;

      const targetTotal = window.PsychoCore.intRange(
        random,
        300,
        Math.min(500, Math.max(330, Math.round(height * 0.54)))
      );

      for (let i = 0; i < map.layerCount && totalHeight < targetTotal; i += 1) {
        const layerName = window.PsychoCore.pick(random, layerNames);
        const palette = window.PsychoCore.coreLayerPalettes[layerName];
        const colorA = window.PsychoCore.pick(random, palette);
        const colorB = window.PsychoCore.pick(random, palette);
        const rawHeight = window.PsychoCore.intRange(random, 20, 60);
        const layerHeight = Math.max(16, Math.round(rawHeight / map.compression));
        const fossilSeed = (seed + i * 2654435761) >>> 0;
        const hasFossil = random() < map.fossilChance;
        const mark = hasFossil ? window.PsychoCore.pick(random, window.PsychoCore.fossilMarks) : "";

        layers.push({
          index: i,
          seed: fossilSeed,
          parentSeed: seed,
          color: colorA,
          colorB,
          height: layerHeight,
          texturePattern: window.PsychoCore.patternFor(layerName),
          geologicName: layerName,
          fossilContent: hasFossil ? window.PsychoCore.fossilPhrase(fossilSeed) : null,
          fossilMark: mark,
          temporal: map.temporal,
          semanticDensity: map.semanticDensity,
          depthLabel: map.label,
          depthAge: map.age,
          coordinates: {
            x: Math.round(x),
            y: Math.round(y)
          }
        });

        totalHeight += layerHeight;
      }

      return {
        seed,
        x,
        y,
        totalHeight,
        depth: map,
        layers
      };
    }

    renderCore(coreData) {
      const core = document.createElement("article");
      core.className = "core-sample";
      core.setAttribute("aria-label", `Carota di sedimento ${coreData.depth.label}, ${coreData.layers.length} strati`);
      core.dataset.seed = String(coreData.seed);

      const surfaceWidth = this.container.clientWidth || window.innerWidth;
      const surfaceHeight = this.container.clientHeight || window.innerHeight;
      const left = window.PsychoCore.clamp(coreData.x, 58, surfaceWidth - 58);
      const bottomDistance = window.PsychoCore.clamp(surfaceHeight - coreData.y, 96, surfaceHeight - 80);

      core.style.left = `${left}px`;
      core.style.bottom = `${bottomDistance}px`;
      core.style.height = `${coreData.totalHeight + 46}px`;

      const body = document.createElement("div");
      body.className = "core-sample__body";
      body.style.height = `${coreData.totalHeight + 18}px`;

      const cap = document.createElement("div");
      cap.className = "core-sample__cap";
      body.appendChild(cap);

      coreData.layers.forEach((layer) => {
        const stratum = document.createElement("div");
        stratum.className = "stratum";
        stratum.dataset.seed = String(layer.seed);
        stratum.dataset.layer = JSON.stringify({
          geologicName: layer.geologicName,
          fossilContent: layer.fossilContent,
          depthLabel: layer.depthLabel,
          depthAge: layer.depthAge,
          x: layer.coordinates.x,
          y: layer.coordinates.y
        });
        stratum.dataset.fossilMark = layer.fossilMark;
        stratum.style.height = `${layer.height}px`;
        stratum.style.background = `
          linear-gradient(90deg, ${layer.color}, ${layer.colorB}, ${layer.color}),
          ${layer.texturePattern}
        `;
        stratum.style.backgroundBlendMode = "multiply, overlay";
        stratum.style.setProperty("--grain-size", `${18 + (layer.index % 5) * 7}px`);
        stratum.style.setProperty("--stratum-noise", `${0.22 + layer.semanticDensity * 0.34}`);

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = layer.fossilContent
          ? `Apri sezione sottile: ${layer.fossilContent}`
          : `Apri sezione sottile: strato ${layer.geologicName}`;
        button.setAttribute("aria-label", button.textContent);

        stratum.appendChild(button);
        body.appendChild(stratum);
      });

      const label = document.createElement("p");
      label.className = "core-label";
      label.textContent = `${coreData.depth.label} / ${coreData.depth.age} / seed ${coreData.seed.toString(16).slice(0, 6)}`;

      core.appendChild(body);
      core.appendChild(label);

      this.container.appendChild(core);
      this.activeCores.push(core);
      this.limitCores();
      this.animateEmergence(core);

      return core;
    }

    animateEmergence(element) {
      element.style.animation = "none";
      element.offsetHeight;
      element.style.animation = "";
    }

    limitCores() {
      while (this.activeCores.length > this.maxCores) {
        const oldest = this.activeCores.shift();
        if (oldest) {
          oldest.animate(
            [
              { opacity: 1, transform: oldest.style.transform || "translate(-50%, 0) scaleY(1)" },
              { opacity: 0, transform: "translate(-50%, 18px) scaleY(0.94)" }
            ],
            {
              duration: 260,
              easing: "ease",
              fill: "forwards"
            }
          );

          window.setTimeout(() => oldest.remove(), 270);
        }
      }
    }

    createAt(x, y) {
      const coreData = this.generateCore(x, y);
      return this.renderCore(coreData);
    }

    createRandom() {
      const x = window.PsychoCore.range(Math.random, window.innerWidth * 0.18, window.innerWidth * 0.82);
      const y = window.PsychoCore.range(Math.random, window.innerHeight * 0.18, window.innerHeight * 0.72);
      return this.createAt(x, y);
    }
  }

  window.StrataManager = StrataManager;
})();

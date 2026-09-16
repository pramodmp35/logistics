 <script>
      /* ==========================================================
         AUTH / STORED USER
      ========================================================== */
      let user = {
        email: "admin@logiver.com",
        name: "Admin",
        role: "ADMIN",
      };

      try {
        const raw = localStorage.getItem("logiverUser");
        if (raw) user = Object.assign(user, JSON.parse(raw));
      } catch (e) {
        /* ignore malformed storage */
      }

      const initial = (user.name || user.email || "A")
        .trim()
        .charAt(0)
        .toUpperCase();

      document.querySelectorAll("[data-user-email]").forEach((el) => {
        el.textContent = user.email || "admin@logiver.com";
      });

      document.querySelectorAll("[data-user-name]").forEach((el) => {
        el.textContent = user.name || "Admin";
      });

      document.querySelectorAll("[data-user-initial]").forEach((el) => {
        el.textContent = initial;
      });

      const emailInput = document.querySelector("[data-user-email-input]");
      if (emailInput) emailInput.value = user.email || "";

      const nameInput = document.querySelector("[data-user-name-input]");
      if (nameInput) nameInput.value = user.name || "Admin";

      /* Today's date */
      const dateEl = document.getElementById("todayDate");
      if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      /* ==========================================================
         SIDEBAR
      ========================================================== */
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("overlay");
      const menuBtn = document.getElementById("menuBtn");
      const closeSidebarBtn = document.getElementById("closeSidebar");

      function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        if (window.innerWidth < 1024) document.body.classList.add("no-scroll");
      }

      function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove("no-scroll");
      }

      menuBtn.addEventListener("click", openSidebar);
      closeSidebarBtn.addEventListener("click", closeSidebar);
      overlay.addEventListener("click", closeSidebar);

      window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) {
          overlay.classList.remove("show");
          document.body.classList.remove("no-scroll");
        }
      });

      /* ==========================================================
         PAGE NAVIGATION
      ========================================================== */
      const pageTitle = document.getElementById("pageTitle");
      const navLinks = document.querySelectorAll(".nav-link[data-page]");

      function goToPage(page) {
        const link = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (link) link.click();
      }

      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          const page = link.dataset.page;
          const target = document.getElementById("page-" + page);
          if (!target) return;

          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");

          document.querySelectorAll(".page").forEach((p) => {
            p.classList.remove("active");
          });
          target.classList.add("active");

          if (pageTitle) {
            pageTitle.textContent =
              link.dataset.title || link.textContent.trim();
          }

          if (window.innerWidth < 1024) closeSidebar();

          window.scrollTo({ top: 0, behavior: "smooth" });

          /* Lazy-init charts for the newly visible page */
          requestAnimationFrame(() => initChartsFor(page));
        });
      });

      /* "View all" style buttons */
      document.querySelectorAll("[data-goto]").forEach((btn) => {
        btn.addEventListener("click", () => goToPage(btn.dataset.goto));
      });

      /* ==========================================================
         ANIMATED COUNTERS
      ========================================================== */
      function animateCount(el) {
        const target = parseFloat(el.dataset.count || "0");
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const duration = 1700;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = target * eased;
          el.textContent =
            prefix +
            value.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }) +
            suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 },
      );

      document
        .querySelectorAll("[data-count]")
        .forEach((el) => counterObserver.observe(el));

      /* ==========================================================
         SCROLL REVEAL
      ========================================================== */
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
      );

      document
        .querySelectorAll(".reveal")
        .forEach((el) => revealObserver.observe(el));

      /* ==========================================================
         CHARTS
      ========================================================== */
      Chart.defaults.font.family = "'Outfit', sans-serif";
      Chart.defaults.font.size = 11;
      Chart.defaults.color = "#94a3b8";

      const charts = {};

      /* Center label plugin for doughnut */
      const centerLabelPlugin = {
        id: "centerLabel",
        afterDraw(chart) {
          if (chart.config.type !== "doughnut") return;
          const {
            ctx,
            chartArea: { left, right, top, bottom },
          } = chart;
          const x = (left + right) / 2;
          const y = (top + bottom) / 2;
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#0f313a";
          ctx.font = "800 26px Outfit, sans-serif";
          ctx.fillText("18.6K", x, y - 8);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "700 10px Outfit, sans-serif";
          ctx.fillText("TOTAL UNITS", x, y + 14);
          ctx.restore();
        },
      };
      Chart.register(centerLabelPlugin);

      const tooltipStyle = {
        backgroundColor: "#0f313a",
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: "700" },
        bodyFont: { size: 11 },
        usePointStyle: true,
        displayColors: true,
        boxPadding: 4,
      };

      const legendStyle = {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { size: 11, weight: "700" },
        },
      };

      function makeGradient(ctx, color, height) {
        const g = ctx.createLinearGradient(0, 0, 0, height || 300);
        g.addColorStop(0, color.replace("ALPHA", "0.35"));
        g.addColorStop(1, color.replace("ALPHA", "0"));
        return g;
      }

      /* ---------- DASHBOARD CHARTS ---------- */
      function buildVolumeChart() {
        const canvas = document.getElementById("chartVolume");
        if (!canvas || charts.volume) return;
        const ctx = canvas.getContext("2d");

        charts.volume = new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            datasets: [
              {
                label: "Shipments",
                data: [
                  820, 940, 1080, 1010, 1240, 1380, 1290, 1460, 1520, 1680,
                  1740, 1842,
                ],
                borderColor: "#5094c1",
                backgroundColor: makeGradient(
                  ctx,
                  "rgba(80,148,193,ALPHA)",
                  320,
                ),
                fill: true,
                tension: 0.42,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "#5094c1",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
              },
              {
                label: "Delivered",
                data: [
                  700, 830, 960, 910, 1120, 1240, 1180, 1330, 1400, 1540, 1610,
                  1690,
                ],
                borderColor: "#fac12e",
                backgroundColor: makeGradient(
                  ctx,
                  "rgba(250,193,46,ALPHA)",
                  320,
                ),
                fill: true,
                tension: 0.42,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "#fac12e",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: legendStyle,
              tooltip: tooltipStyle,
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 10, weight: "600" } },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(15,49,58,0.07)" },
                border: { display: false },
                ticks: {
                  maxTicksLimit: 6,
                  font: { size: 10, weight: "600" },
                },
              },
            },
          },
        });
      }

      function buildStatusChart() {
        const canvas = document.getElementById("chartStatus");
        if (!canvas || charts.status) return;

        charts.status = new Chart(canvas.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: ["Delivered", "In Transit", "Pending", "Delayed"],
            datasets: [
              {
                data: [16902, 1284, 234, 180],
                backgroundColor: ["#104a57", "#5094c1", "#fac12e", "#f94735"],
                borderWidth: 0,
                hoverOffset: 10,
                spacing: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                  boxWidth: 8,
                  boxHeight: 8,
                  padding: 14,
                  font: { size: 11, weight: "700" },
                },
              },
              tooltip: tooltipStyle,
            },
          },
        });
      }

      function buildRevenueChart() {
        const canvas = document.getElementById("chartRevenue");
        if (!canvas || charts.revenue) return;

        charts.revenue = new Chart(canvas.getContext("2d"), {
          type: "bar",
          data: {
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            datasets: [
              {
                label: "Revenue",
                data: [62, 74, 81, 78, 96, 108, 101, 118, 124, 136, 142, 151],
                backgroundColor: "#5094c1",
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 20,
              },
              {
                label: "Cost",
                data: [38, 44, 49, 46, 56, 62, 59, 68, 72, 78, 82, 86],
                backgroundColor: "#fac12e",
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 20,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: legendStyle,
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  label: (c) => `${c.dataset.label}: $${c.parsed.y}k`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 10, weight: "600" } },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(15,49,58,0.07)" },
                border: { display: false },
                ticks: {
                  maxTicksLimit: 6,
                  font: { size: 10, weight: "600" },
                  callback: (v) => "$" + v + "k",
                },
              },
            },
          },
        });
      }

      function buildPerfChart() {
        const canvas = document.getElementById("chartPerf");
        if (!canvas || charts.perf) return;

        charts.perf = new Chart(canvas.getContext("2d"), {
          type: "radar",
          data: {
            labels: [
              "On-Time",
              "Safety",
              "Cost",
              "Satisfaction",
              "Coverage",
              "Speed",
            ],
            datasets: [
              {
                label: "This Quarter",
                data: [92, 88, 76, 94, 81, 87],
                borderColor: "#f94735",
                backgroundColor: "rgba(249,71,53,0.18)",
                borderWidth: 2,
                pointBackgroundColor: "#f94735",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
              },
              {
                label: "Last Quarter",
                data: [85, 82, 71, 88, 74, 80],
                borderColor: "#5094c1",
                backgroundColor: "rgba(80,148,193,0.15)",
                borderWidth: 2,
                pointBackgroundColor: "#5094c1",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                  boxWidth: 8,
                  boxHeight: 8,
                  padding: 12,
                  font: { size: 10, weight: "700" },
                },
              },
              tooltip: tooltipStyle,
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                grid: { color: "rgba(15,49,58,0.1)" },
                angleLines: { color: "rgba(15,49,58,0.1)" },
                pointLabels: {
                  font: { size: 10, weight: "700" },
                  color: "#64748b",
                },
                ticks: { display: false, stepSize: 25 },
              },
            },
          },
        });
      }

      /* ---------- REPORT CHARTS ---------- */
      function buildRoutesChart() {
        const canvas = document.getElementById("chartRoutes");
        if (!canvas || charts.routes) return;

        charts.routes = new Chart(canvas.getContext("2d"), {
          type: "bar",
          data: {
            labels: [
              "Mumbai → Dubai",
              "Delhi → Singapore",
              "Pune → Frankfurt",
              "Chennai → Doha",
              "Kolkata → Bangkok",
              "Bengaluru → Tokyo",
            ],
            datasets: [
              {
                label: "Shipments",
                data: [1842, 1410, 1120, 864, 612, 548],
                backgroundColor: [
                  "#104a57",
                  "#5094c1",
                  "#fac12e",
                  "#f94735",
                  "#0f313a",
                  "#3d7ba3",
                ],
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 26,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: tooltipStyle,
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: "rgba(15,49,58,0.07)" },
                border: { display: false },
                ticks: { font: { size: 10, weight: "600" } },
              },
              y: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 10, weight: "700" } },
              },
            },
          },
        });
      }

      function buildOnTimeChart() {
        const canvas = document.getElementById("chartOnTime");
        if (!canvas || charts.onTime) return;
        const ctx = canvas.getContext("2d");

        charts.onTime = new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
            ],
            datasets: [
              {
                label: "On-Time %",
                data: [94.2, 95.1, 93.8, 96.4, 97.1, 96.2, 97.8, 98.0, 98.2],
                borderColor: "#f94735",
                backgroundColor: makeGradient(
                  ctx,
                  "rgba(249,71,53,ALPHA)",
                  300,
                ),
                fill: true,
                tension: 0.42,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "#f94735",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  label: (c) => `On-Time: ${c.parsed.y}%`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 10, weight: "600" } },
              },
              y: {
                min: 90,
                max: 100,
                grid: { color: "rgba(15,49,58,0.07)" },
                border: { display: false },
                ticks: {
                  font: { size: 10, weight: "600" },
                  callback: (v) => v + "%",
                },
              },
            },
          },
        });
      }

      /* ---------- LAZY CHART INIT ---------- */
      function initChartsFor(page) {
        if (page === "dashboard") {
          buildVolumeChart();
          buildStatusChart();
          buildRevenueChart();
          buildPerfChart();
        }
        if (page === "reports") {
          buildRoutesChart();
          buildOnTimeChart();
        }
      }

      /* Build the default page's charts on load */
      window.addEventListener("load", () => {
        initChartsFor("dashboard");
      });
    </script>
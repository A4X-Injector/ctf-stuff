var api = (function() {
    var makeCall = function(endpoint, data, callback) {
        $.ajax({
            url: "/api" + endpoint,
            data: data,
            dataType: "json",
            method: "POST",
            success: function(data) {
                console.log(data);
                callback(data);
                console.log("API call complete");
            },
            failure: function(data) {
                console.error("API call failed");
            }
        });
    };

    var makeCallGet = function(endpoint, data, callback) {
        $.ajax({
            url: "/api" + endpoint,
            data: data,
            dataType: "json",
            method: "GET",
            success: function(data) {
                console.log(data);
                callback(data);
                console.log("API call complete");
            },
            failure: function(data) {
                console.error("API call failed");
            }
        });
    };

    return {
        makeCall: makeCall,
        makeCallGet: makeCallGet
    };
})();

// Static-site safe defaults for challenge submit flow
if (typeof window !== "undefined") {
    if (typeof window.score === "undefined") {
        window.score = 0;
    }
    if (typeof window.calculateLevel === "undefined") {
        window.calculateLevel = function(score, points) {
            score = score || 0;
            points = points || 0;
            return score + points;
        };
    }
    if (typeof window.showCorrectToast === "undefined") {
        window.showCorrectToast = function(message) {
            if (window.Materialize && typeof Materialize.toast === "function") {
                Materialize.toast(message || "Correct!", 4000, "green");
            }
        };
    }
    if (typeof window.handleCorrectFlag === "undefined") {
        window.handleCorrectFlag = function(id) {
            if (!id) return;
            try {
                localStorage.setItem("solved-" + id, "1");
            } catch (e) {}
            window.showCorrectToast("Correct!");
        };
    }
    if (typeof window.applySolvedState === "undefined") {
        window.applySolvedState = function() {
            var forms = document.querySelectorAll("form[data-challenge]");
            forms.forEach(function(form) {
                var id = form.getAttribute("data-challenge");
                if (!id) return;
                var solved = false;
                try {
                    solved = localStorage.getItem("solved-" + id) === "1";
                } catch (e) {}
                if (!solved) return;
                var uncheck = document.getElementById("uncheck-" + id);
                var check = document.getElementById("check-" + id);
                if (uncheck) uncheck.style.display = "none";
                if (check) check.style.display = "";
                form.style.display = "none";
                var youSolved = document.getElementById("youvesolved-" + id);
                if (youSolved) youSolved.style.display = "";
            });
        };
    }
    document.addEventListener("DOMContentLoaded", function() {
        if (window.applySolvedState) window.applySolvedState();
    });
}

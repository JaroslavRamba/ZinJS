new zinjs.core.PluginPrototype(
    "zoom",
    zinjs.core.pluginType.ACTION,
    function(percent)
    {
        var container = null;
        var node = null;
        if (this.node.parentNode.className != "Container") {
            container = document.createElement("div");
            node = this.node;
            container.className = "Container";
            node.parentNode.appendChild(container);
            container.appendChild(node);

            container.style.overflow="hidden";
            if (node.style.width === undefined || node.style.width === "") {
                console.log("width undefined");
                container.style.width = node.width;
            }
            else {
                container.style.width = node.style.width;
            }

            if (node.style.height === undefined || node.style.height === "") {
                console.log("height undefined");
                container.style.height = node.height;
            }
            else {
                container.style.height = node.style.height;
            }
        }
        this.addCss({
            transform: {
                scale: "1"
            },
            transition: "all 0s ease-out"
        });
        container = this.node.parentNode;
        node = this.node;
        this.addCss({
            transform: {
                scale: (percent/100) + ""
            },
            transition: "all 1s ease-out"
        });
    }
);


exports.component = `
<dom-module id="$NAME">
    <template>
        <style include="shared-styles">
            :host {
                display: block;
                border: 1px dashed red;
            }
        </style>
        $NAME component
    </template>

    <script>
        class $NAME_CAMELCASED extends Polymer.Element {

            static get is() {
                return '$NAME'
            }

            static get properties() {
                return {
                    current: {
                        type: String
                    },
                }
            }
        }
        window.customElements.define($NAME_CAMELCASED.is, $NAME_CAMELCASED);
    </script>
</dom-module>
`

exports.page = `
<link rel="import" href="/src/components/base-page.html">

<dom-module id="$NAME">
    <template>
        <style include="shared-styles">
            :host {
                display: block;
                border: 1px dotted blue;
            }
        </style>
        $NAME PAGE
    </template>

    <script>
        class $NAME_CAMELCASED extends BasePage {

            static get is() {
                return '$NAME'
            }

            static get properties() {
                return {
                    current: {
                        type: String
                    }
                }
            }
        }
        window.customElements.define($NAME_CAMELCASED.is, $NAME_CAMELCASED);
    </script>
</dom-module>
`
const https = require("https");

exports.search = function (settings, componentsSet) {
    var requestCount = componentsSet.size;
    const searchResult = [];
    console.log("Looking for elements on webcomponents.org...")
    return new Promise((res, rej) => {
        componentsSet.forEach(element => {
            https.get(getUrl(element), (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    var result = JSON.parse(data.toString('utf8')).results;
                    if (result && result.length) {
                        var desiredImport = null,
                            allResults = [],
                            goodMatch = null,
                            exactMatch = null;
                        result.forEach(res => {
                            allResults.push(`${res.owner}/${res.repo}`)
                            if (settings.webcomponents.owners.indexOf(res.owner) !== -1) {
                                if (!goodMatch) {
                                    desiredImport = res;
                                }
                                if(!exactMatch && element === desiredImport.repo){
                                    exactMatch = res;
                                }
                            }
                        })
                        desiredImport === exactMatch || goodMatch;
                        if (desiredImport) {
                            var bowerString = `${desiredImport.owner}/${desiredImport.repo}`
                            console.log(`webcomponents.org ${element} found ${bowerString}`)
                            searchResult.push(bowerString);
                        } else {
                            console.log(`webcomponents.org ${element} found ${allResults.join(", ")} but ignored because of settings.webcomponents.owners allowance rule`)
                        }
                    } else {
                        console.warn(`webcomponents.org ${element} nothing found`)
                    }
                    minusRequest()
                })

            }).on('error', (e) => {
                console.warn(`webcomponents.org error when searching for ${element}: ${e}`)
                minusRequest()
            });
        })
        function minusRequest() {
            requestCount--;
            if (!requestCount) {
                res(searchResult)
            }
        }
    })
}


function getUrl(component) {
    return `https://www.webcomponents.org/api/search/${component}%20kind:element?limit=2`
}


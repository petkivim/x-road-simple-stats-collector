# X-Road Simple Stats Collector

This is a simple statistics collector for the X-Road that reads the number
of members, security servers, subsystems and number of members per member
class from global configuration. The results are returned as a json object.

This is how the results look like:

```
{
    "instanceIdentifier": "DEV",
    "members": 105,
    "subsystems": 293,
    "securityServers": 102,
    "memberClasses": [
        {
            "memberClass": "GOV",
            "memberCount": 29
        },
        {
            "memberClass": "COM",
            "memberCount": 32
        },
        {
            "memberClass": "MUN",
            "memberCount": 42
        },
        {
            "memberClass": "ORG",
            "memberCount": 0
        },
        {
            "memberClass": "EDU",
            "memberCount": 2
        }
    ]
}
```

## Prerequisites

* git
* npm
* Node.js

## Try it

Clone the repository:

```
git clone https://github.com/petkivim/x-road-simple-stats-collector.git
```

Install dependencies:

```
cd x-road-simple-stats-collector/
npm install
```

Update configuration. `config.anchorPath` OR `config.url` must be defined.

```
config.anchorPath = '/path/to/configuration_anchor.xml'

config.url = 'http://xxx.xxx.xxx.xxx/internalconf'
```

Run the script:

```
node index.js
```

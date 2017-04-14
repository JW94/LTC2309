'use strict';

var i2c = require('i2c');

var RES = 12;
var RES_STEPS = Math.pow(2,RES);
var REF_VOLTAGE = 4.096;
var VOLTAGE_FACT = REF_VOLTAGE/(RES_STEPS-1)
var UNI_MODE = 0x08;
var CHANNELS = 
{
    "adc0": 0x80,
    "adc1": 0xC0,
    "adc2": 0x90,
    "adc3": 0xD0,
    "adc4": 0xA0,
    "adc5": 0xE0,
    "adc6": 0xB0,
    "adc7": 0xF0,
};

var ltc2309 = function(device, address) 
{
    this.device = device;
    this.address = address;
    this.wire = new i2c(this.address,{device: this.device});
}

ltc2309.prototype.getADCRaw = function(channel,Mode,callback)
{
    console.log("Unimode-Value: " + UNI_MODE);
    console.log("Channel-Value: " + CHANNELS[channel]);
    // Discard first 
    this.wire.readBytes(CHANNELS[channel] + Mode,2, function(err,data){});
    // Use this callback for returning the adcx-value
    this.wire.readBytes(CHANNELS[channel] + Mode,2, function(err,data)
    {
        if (err != null) {
            console.log("I2C read error", err);
            throw new Error(err);
        }
        for (var i = 0; i<data.length; i++) 
        {
            if (isNaN(parseInt(data[i]))) 
            {
                data[i] = 0;
            }
        }
        // Shift data
        // Discard the first 4-bits of the least-significant-byte
        // Shift left the bits of the most-significant-byte 4-times
        var value = (data[1]>>4)+(data[0]<<4);
        callback(value);
    });
}

ltc2309.prototype.getADCVolt = function(channel,mode,callback)
{
    var self = this;
    self.getADCRaw(channel,mode,function(adcraw)
    {
        var value = (adcraw) * VOLTAGE_FACT;
        callback(value);
    });
}

// var adcx = new ltc2309('/dev/i2c-2',0x0A);
// adcx.getADCVolt("adc0",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCVolt("adc0",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc1",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc2",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc3",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc4",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc5",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc6",UNI_MODE,function(data)
// {
    // console.log(data);
// });
// adcx.getADCRaw("adc7",UNI_MODE,function(data)
// {
    // console.log(data);
// });

module.exports = ltc2309;
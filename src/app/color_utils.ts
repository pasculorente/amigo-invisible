export function generateColorWheel(numColors: number, lightness = 0.5) {
    const colors = []
    const contrastColors = []
    const hueStep = 360 / numColors

    for (let i = 0; i < numColors; i++) {
        const hue = i * hueStep
        const color = `hsl(${hue}, 100%, ${lightness * 100}%)`
        colors.push(color)

        // Calculate the highest contrast color
        let contrastColor
        if (hue >= 20 && hue < 200) {
            // Yellows and greens use black
            contrastColor = 'black'
        } else {
            // Blues and reds use white
            contrastColor = 'white'
        }
        contrastColors.push(contrastColor)
    }

    return [colors, contrastColors]
}

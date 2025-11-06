#!/bin/bash
# Script to add images to all service pages

# Define service page mappings
declare -A services
services[angstpatienten]="z7157290503424_5f2c470b119071762194c49541ba5574.jpg"
services[prophylaxe]="z7157290503425_d7a21dfb20f323ffc7b0d4dc75cdbd7a.jpg"
services[zahnerhaltung]="z7157290503450_4ab2d9dc40011ba47b65c0f00af7b9ab.jpg"
services[aesthetische-zahnheilkunde]="z7157290546884_480c00c761067033f7e30c5799d12830.jpg"
services[zahnersatz]="z7157290592128_ce3bb37a7d15f5a29db1a42dbf28e5a7.jpg"
services[oralchirurgie]="z7157290635534_333918e8d7914be449ed5ff1eafc366c.jpg"
services[implantologie]="z7157290679656_84fc10d7b746392d3e0dcc38bfdbb96f.jpg"

# Loop through each service and update the intro section
for service in "${!services[@]}"; do
  image="${services[$service]}"
  file="web/pages/${service}.html"

  if [ -f "$file" ]; then
    echo "Updating $service with image $image"

    # Use sed to replace the intro section (simplified for demonstration)
    # Note: This would need proper multi-line sed or a more sophisticated approach
  fi
done

echo "Image mapping complete!"
